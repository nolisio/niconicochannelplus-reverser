(() => {
  const ENABLED_KEY = "nicoAudioSwapEnabled";

  class AudioSwapController {
    constructor() {
      this.enabled = false;
      this.context = null;
      this.graphs = new WeakMap();
      this.activeVideo = null;
      this.activeGraph = null;
      this.observer = null;
      this.refreshTimer = null;
      this.refreshInFlight = false;
      this.refreshQueued = false;
      this.gestureListening = false;

      this.onStorageChanged = this.onStorageChanged.bind(this);
      this.onMutation = this.onMutation.bind(this);
      this.onUserGesture = this.onUserGesture.bind(this);
      this.onPageHide = this.onPageHide.bind(this);
      this.onContextStateChange = this.onContextStateChange.bind(this);
    }

    async init() {
      const data = await chrome.storage.local.get({ [ENABLED_KEY]: false });
      this.enabled = Boolean(data[ENABLED_KEY]);

      chrome.storage.onChanged.addListener(this.onStorageChanged);
      window.addEventListener("pagehide", this.onPageHide);
      this.startObserver();
      this.requestRefresh();
    }

    startObserver() {
      const root = document.documentElement;
      if (!root) {
        return;
      }

      this.observer = new MutationObserver(this.onMutation);
      this.observer.observe(root, { childList: true, subtree: true });
    }

    onMutation() {
      if (this.refreshTimer !== null) {
        return;
      }

      this.refreshTimer = window.setTimeout(() => {
        this.refreshTimer = null;
        this.requestRefresh();
      }, 100);
    }

    async onStorageChanged(changes, areaName) {
      if (areaName !== "local" || !(ENABLED_KEY in changes)) {
        return;
      }

      this.enabled = Boolean(changes[ENABLED_KEY].newValue);
      this.requestRefresh();
    }

    onPageHide() {
      this.removeGestureListeners();
      this.observer?.disconnect();
      this.deactivateActiveGraph();
      this.activeVideo = null;
      this.activeGraph = null;

      if (this.context && this.context.state !== "closed") {
        void this.context.close();
      }
    }

    onContextStateChange() {
      if (!this.context || this.context.state === "closed") {
        return;
      }

      if (this.context.state === "running") {
        this.removeGestureListeners();
        this.requestRefresh();
        return;
      }

      if (this.enabled || this.activeGraph) {
        this.installGestureListeners();
      }
    }

    requestRefresh() {
      if (this.refreshInFlight) {
        this.refreshQueued = true;
        return;
      }

      this.refreshInFlight = true;
      void this.flushRefresh();
    }

    async flushRefresh() {
      do {
        this.refreshQueued = false;
        await this.performRefresh();
      } while (this.refreshQueued);

      this.refreshInFlight = false;
    }

    getCurrentVideo() {
      const videos = Array.from(document.querySelectorAll("video"));
      if (!videos.length) {
        return null;
      }

      return (
        videos.find((video) => !video.paused && !video.ended) ??
        videos.find((video) => video.readyState >= 2) ??
        videos[0]
      );
    }

    async performRefresh() {
      try {
        const currentVideo = this.getCurrentVideo();

        if (!currentVideo) {
          this.deactivateActiveGraph();
          this.activeVideo = null;
          this.activeGraph = null;
          return;
        }

        if (!this.enabled) {
          if (this.activeVideo && this.activeVideo !== currentVideo) {
            this.deactivateActiveGraph();
            this.activeVideo = null;
            this.activeGraph = null;
            return;
          }

          if (!this.activeGraph) {
            this.removeGestureListeners();
            return;
          }

          const running = await this.ensureRunningContext(false);
          if (!running) {
            this.installGestureListeners();
            return;
          }

          this.removeGestureListeners();
          this.activateGraph(this.activeGraph);
          this.applyBypass(this.activeGraph);
          return;
        }

        const running = await this.ensureRunningContext(true);
        if (!running) {
          this.installGestureListeners();
          return;
        }

        this.removeGestureListeners();

        if (this.activeVideo !== currentVideo) {
          this.deactivateActiveGraph();
          this.activeVideo = currentVideo;
          this.activeGraph = this.getOrCreateGraph(currentVideo);
        }

        this.activateGraph(this.activeGraph);
        this.applySwap(this.activeGraph);
      } catch (error) {
        console.error("[Stereo Swap for nicochannel.jp]", error);
      }
    }

    async ensureRunningContext(createIfMissing) {
      if (!this.context || this.context.state === "closed") {
        if (!createIfMissing) {
          return false;
        }

        this.context = new AudioContext();
        this.context.onstatechange = this.onContextStateChange;
      }

      if (this.context.state === "running") {
        return true;
      }

      try {
        await this.context.resume();
      } catch (error) {
        console.warn("[Stereo Swap for nicochannel.jp] resume failed", error);
      }

      return this.context.state === "running";
    }

    getOrCreateGraph(video) {
      const cachedGraph = this.graphs.get(video);
      if (cachedGraph) {
        return cachedGraph;
      }

      const normalGain = this.context.createGain();
      const swappedGain = this.context.createGain();
      normalGain.gain.value = 0;
      swappedGain.gain.value = 0;

      const graph = {
        video,
        source: this.context.createMediaElementSource(video),
        splitter: this.context.createChannelSplitter(2),
        merger: this.context.createChannelMerger(2),
        normalGain,
        swappedGain,
        connected: false,
      };

      graph.source.connect(graph.normalGain);
      graph.source.connect(graph.splitter);
      graph.splitter.connect(graph.merger, 0, 1);
      graph.splitter.connect(graph.merger, 1, 0);
      graph.merger.connect(graph.swappedGain);

      this.graphs.set(video, graph);
      return graph;
    }

    activateGraph(graph) {
      if (!graph.connected) {
        graph.normalGain.connect(this.context.destination);
        graph.swappedGain.connect(this.context.destination);
        graph.connected = true;
      }
    }

    deactivateActiveGraph() {
      if (!this.activeGraph) {
        return;
      }

      this.activeGraph.normalGain.gain.value = 0;
      this.activeGraph.swappedGain.gain.value = 0;

      if (this.activeGraph.connected) {
        this.activeGraph.normalGain.disconnect();
        this.activeGraph.swappedGain.disconnect();
        this.activeGraph.connected = false;
      }
    }

    applyBypass(graph) {
      graph.normalGain.gain.value = 1;
      graph.swappedGain.gain.value = 0;
    }

    applySwap(graph) {
      graph.normalGain.gain.value = 0;
      graph.swappedGain.gain.value = 1;
    }

    installGestureListeners() {
      if (this.gestureListening) {
        return;
      }

      this.gestureListening = true;
      document.addEventListener("pointerdown", this.onUserGesture, true);
      document.addEventListener("keydown", this.onUserGesture, true);
      document.addEventListener("touchend", this.onUserGesture, true);
    }

    removeGestureListeners() {
      if (!this.gestureListening) {
        return;
      }

      this.gestureListening = false;
      document.removeEventListener("pointerdown", this.onUserGesture, true);
      document.removeEventListener("keydown", this.onUserGesture, true);
      document.removeEventListener("touchend", this.onUserGesture, true);
    }

    async onUserGesture() {
      const running = await this.ensureRunningContext(this.enabled);
      if (!running) {
        return;
      }

      this.removeGestureListeners();
      this.requestRefresh();
    }
  }

  const controller = new AudioSwapController();
  void controller.init();
})();
