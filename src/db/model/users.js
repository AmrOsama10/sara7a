import { model, Schema } from "mongoose";

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: function (value) {
            if (this.phoneNumber) return false;
            return true;
        },
        trim: true,
        lowercase: true
    },
    password: {
        type: String,

        required: function (value) {
            if (this.userAgent === "google") return false;
            return true;
        }
    },
    phoneNumber: {
        type: String,
        required: function (value) {
            if (this.email) return false;
            return true;
        },
    },
    dob: {
        type: Date,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userAgent: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    otp: {
        type: Number
    },
    otpExpiry: {
        type: Date
    },
    otpAttempts: {
        type: Number, default: 0
    },
    otpBlockedUntil: {
        type: Date, default: null
    },

    profilePicture: {
        secure_url: String,
        public_id: String
    }
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
})

userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
})

userSchema.virtual("fullName").set(function (value) {
    const [firstName, lastName] = value.split(" ")
    this.firstName = firstName;
    this.lastName = lastName;
})

userSchema.virtual("age").get(function () {
    return new Date().getFullYear() - new Date(this.dob).getFullYear();
})

export const User = model("User", userSchema);