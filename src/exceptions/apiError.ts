class ApiError extends Error {
  private _status: number;

  constructor(status: number, message: string) {
    super(message);

    this._status = status;
    this.name = 'ApiError';
  }

  get status() {
    return this._status;
  }
}

export default ApiError;
