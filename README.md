# Firebase JavaScript API  

Underwork, but already works.

---

### Getting started

Download the `firebase.js` and import it.

```javascript
const FirebaseAPI = require('./firebase');
const firebase = new FirebaseAPI(URL, TOKEN);
```

- **`new FirebaseAPI(url: string, token: string)`**  
  Initializes a new authenticated Firebase API.

---

### Methods

**`get(path: string): Promise<any>`**

Fetches the value at the specified path in the Firebase Realtime Database.

**`put(path: string, value: object): Promise<any>`**

Creates or overwrites a value at the given path.

**`delete(path: string): Promise<void>`**

Deletes the node at the specified path.

**`node(path: string): object`**

Returns a special object representing a Firebase node, allowing field access and partial updates through the `update` method.

**`query(path: string): object`**  
Creates a new query object for advanced filtering.

- **`where(field: string, operator: string, value: any): this`** – Adds a filter condition (`==`, `>=`, `<=`, etc.).
- **`execute(): Promise<object>`** – Executes the query and returns matching records.

**`getMetrics(): object`**

Returns internal usage metrics of the Firebase client.

---

### Practical Examples

#### Insert 50 random users
```javascript
(async () => {
    for (let i = 1; i <= 50; i++) {
        await firebase.put(`users/user${i}`, { name: i, age: Math.floor(Math.random() * 122) });
    }
})();
```

---

#### Delete users whose keys start with "3"
```javascript
(async () => {
    const data = await firebase.get("users");
    for (const key in data) {
        if (key.startsWith("3")) {
            await firebase.delete(`users/${key}`);
        }
    }
})();
```
