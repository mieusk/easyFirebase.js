class FirebaseAPI {
    constructor(url, token, options) {
        this.databaseURL = url.replace(/\/$/, ""); // Remove trailing slash
        this.authToken = token;
        this.options = options || {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 5000
        };

        this.metrics = {
            requestCount: 0,
            totalResponseTime: 0,
            errorCount: 0
        };
    }

    async _request(method, path, data, attempt = 1) {
        const startTime = performance.now();

        // Normalize the path
        path = path.replace(/^\/|\/$/g, "");
        if (/\/\//.test(path)) {
            throw new Error("Invalid path: contains empty segments");
        }

        let url = `${this.databaseURL}/${path}.json`;
        if (this.authToken) {
            url += `?auth=${this.authToken}`;
        }

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        const body = data ? JSON.stringify(data) : null;

        try {
            const response = await fetch(url, { method, headers, body });
            const responseTime = performance.now() - startTime;

            this.metrics.requestCount += 1;
            this.metrics.totalResponseTime += responseTime;

            if (!response.ok) {
                this.metrics.errorCount += 1;

                if (response.status >= 500 && attempt < this.options.maxRetries) {
                    const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this._request(method, path, data, attempt + 1);
                }

                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            if (response.status >= 200 && response.status < 300) {
                const text = await response.text();
                return text ? JSON.parse(text) : true;
            }

        } catch (error) {
            this.metrics.errorCount += 1;
            throw new Error(`Network error: ${error.message}`);
        }
    }

    get(path) {
        return this._request("GET", path);
    }

    post(path, data) {
        return this._request("POST", path, data);
    }

    put(path, data) {
        return this._request("PUT", path, data);
    }

    patch(path, data) {
        return this._request("PATCH", path, data);
    }

    delete(path) {
        return this._request("DELETE", path);
    }

    getMetrics() {
        const { requestCount, totalResponseTime, errorCount } = this.metrics;
        return {
            requestCount,
            avgResponseTime: requestCount > 0 ? totalResponseTime / requestCount : 0,
            errorRate: requestCount > 0 ? errorCount / requestCount : 0
        };
    }

    node(path) {
        const api = this;
        const node = {
            _path: path,
            get() {
                return api.get(this._path);
            },
            set(data) {
                return api.put(this._path, data);
            },
            update(data) {
                return api.patch(this._path, data);
            },
            delete() {
                return api.delete(this._path);
            }
        };

        return new Proxy(node, {
            get(target, prop) {
                if (prop in target) {
                    return target[prop];
                }
                return api.get(target._path).then(data => data && data[prop]);
            },
            set(target, prop, value) {
                return api.get(target._path).then(data => {
                    const current = data || {};
                    current[prop] = value;
                    return api.patch(target._path, { [prop]: value });
                });
            }
        });
    }

    query(path) {
        const api = this;
        const query = {
            filters: {},
            path,
            api,
            where(field, operator, value) {
                this.filters[field] = { op: operator, value };
                return this;
            },
            async execute() {
                const data = await api.get(this.path);
                if (!data || typeof data !== "object") return data;

                return Object.fromEntries(Object.entries(data).filter(([id, item]) => {
                    return Object.entries(this.filters).every(([field, condition]) => {
                        const itemValue = item[field];
                        const { op, value } = condition;
                        return (
                            (op === "==" && itemValue === value) ||
                            (op === ">=" && itemValue >= value) ||
                            (op === "<=" && itemValue <= value) ||
                            (op === ">" && itemValue > value) ||
                            (op === "<" && itemValue < value) ||
                            (op === "~=" && itemValue !== value)
                        );
                    });
                }));
            }
        };
        return query;
    }
}

module.exports = FirebaseAPI;
