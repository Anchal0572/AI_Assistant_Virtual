// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     name:{
//         type:String,
//         required:true
//     },
//     email:{
//         type: String,
//         required:true,
//         unique:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     assistantName:{
//        type:String 
//     },
//    assistantImage:{
//     type:String

//     },
//     history:[
//         {type:String}
//     ]
// },{timestamps:true})

// const User= mongoose.model("User",userSchema)
// export default User

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    assistantName: {
        type: String
    },
    assistantImage: {
        type: String
    },
    history: [
        { type: String }
    ]
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

// In-memory store for seamless local demo when external MongoDB Atlas credentials are not connected
const inMemoryUsers = new Map();

class InMemoryDoc {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) {
            this._id = new mongoose.Types.ObjectId().toString();
        }
        if (!this.history) {
            this.history = [];
        }
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
        this.updatedAt = new Date();
    }

    toObject() {
        const obj = { ...this };
        return obj;
    }

    async save() {
        this.updatedAt = new Date();
        inMemoryUsers.set(this._id.toString(), this);
        return this;
    }
}

function wrapResult(doc) {
    if (!doc) return null;
    const instance = new InMemoryDoc(doc);
    return {
        ...instance,
        _id: instance._id,
        name: instance.name,
        email: instance.email,
        password: instance.password,
        assistantName: instance.assistantName,
        assistantImage: instance.assistantImage,
        history: instance.history,
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt,
        toObject: () => instance.toObject(),
        save: async () => instance.save(),
        select: (fields) => {
            const obj = instance.toObject();
            if (fields === "-password") {
                delete obj.password;
            }
            return Promise.resolve(obj);
        },
        then: (resolve) => resolve(instance)
    };
}

const UserProxy = new Proxy(UserModel, {
    get(target, prop) {
        if (mongoose.connection.readyState === 1) {
            return Reflect.get(target, prop);
        }

        if (prop === "create") {
            return async (data) => {
                const doc = new InMemoryDoc(data);
                inMemoryUsers.set(doc._id.toString(), doc);
                return wrapResult(doc);
            };
        }

        if (prop === "findOne") {
            return (query) => {
                let found = null;
                for (const user of inMemoryUsers.values()) {
                    let match = true;
                    for (const [k, v] of Object.entries(query)) {
                        if (user[k] !== v) match = false;
                    }
                    if (match) {
                        found = user;
                        break;
                    }
                }
                const res = wrapResult(found);
                return {
                    select: (fields) => {
                        if (!found) return Promise.resolve(null);
                        const obj = found.toObject();
                        if (fields === "-password") delete obj.password;
                        return Promise.resolve(obj);
                    },
                    then: (resolve) => resolve(res)
                };
            };
        }

        if (prop === "findById") {
            return (id) => {
                const strId = id?.toString();
                const found = inMemoryUsers.get(strId);
                const res = wrapResult(found);
                return {
                    select: (fields) => {
                        if (!found) return Promise.resolve(null);
                        const obj = found.toObject();
                        if (fields === "-password") delete obj.password;
                        return Promise.resolve(obj);
                    },
                    then: (resolve) => resolve(res)
                };
            };
        }

        if (prop === "findByIdAndUpdate") {
            return (id, update) => {
                const strId = id?.toString();
                let found = inMemoryUsers.get(strId);
                if (found) {
                    Object.assign(found, update);
                    found.updatedAt = new Date();
                    inMemoryUsers.set(strId, found);
                }
                const res = wrapResult(found);
                return {
                    select: (fields) => {
                        if (!found) return Promise.resolve(null);
                        const obj = found.toObject();
                        if (fields === "-password") delete obj.password;
                        return Promise.resolve(obj);
                    },
                    then: (resolve) => resolve(res)
                };
            };
        }

        return Reflect.get(target, prop);
    }
});

export default UserProxy;