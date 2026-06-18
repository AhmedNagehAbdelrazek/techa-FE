interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

export class RefreshQueue {
  private queue: QueueItem[] = [];
  private isRefreshing = false;

  get pending(): boolean {
    return this.isRefreshing;
  }

  enqueue(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  start(): void {
    this.isRefreshing = true;
  }

  resolveAll(value: unknown): void {
    this.queue.forEach((item) => item.resolve(value));
    this.queue = [];
    this.isRefreshing = false;
  }

  rejectAll(reason: unknown): void {
    this.queue.forEach((item) => item.reject(reason));
    this.queue = [];
    this.isRefreshing = false;
  }
}
