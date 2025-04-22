# Firebase JavaScript API  

Underwork, but already works.

---

### Getting Started

Download the `firebaseAPI.js` and import it.

```javascript
const FirebaseAPI = require('./firebaseAPI');
const firebase = new FirebaseAPI(URL, TOKEN);
```

- **`new FirebaseAPI(url: string, token: string)`**  
  Initializes a new authenticated Firebase API instance.

---

### Methods

#### `get(path: string): Promise<any>`

Fetches the value at the specified path in the Firebase Realtime Database.

#### `put(path: string, value: object): Promise<any>`

Creates or completely overwrites a value at the given path.

#### `post(path: string, value: object): Promise<any>`

Creates a new child node at the given path and assigns it a Firebase-generated unique key.

#### `patch(path: string, value: object): Promise<any>`

Updates specific fields at the given path without overwriting the entire node.

#### `delete(path: string): Promise<void>`

Deletes the node at the specified path.

#### `node(path: string): object`

Returns a special object representing a Firebase node, allowing field access and updates through the `update` method.

#### `query(path: string): object`

Creates a new query object for advanced filtering.

- **`where(field: string, operator: string, value: any): this`** – Adds a filter condition (`==`, `>=`, `<=`, etc.).
- **`execute(): Promise<object>`** – Executes the query and returns matching records.

#### `getMetrics(): object`

Returns internal usage metrics of the Firebase client, such as the number of requests, average response time, and error rate.

---

### Practical Examples

#### Insert 50 Random Users
```javascript
(async () => {
    for (let i = 1; i <= 50; i++) {
        await firebase.put(`users/user${i}`, { name: `User ${i}`, age: Math.floor(Math.random() * 122) });
    }
})();
```

#### Add a User with a Firebase-Generated Key
```javascript
(async () => {
    const response = await firebase.post("users", { name: "John Doe", age: 30 });
    console.log("User added with Firebase-generated key:", response);
})();
```

#### Update Specific Fields for a User
```javascript
(async () => {
    await firebase.patch("users/user1", { age: 35 });
    console.log("User's age updated successfully.");
})();
```

#### Delete Users Whose Keys Start with "3"
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
