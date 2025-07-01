import mongoose,{Schema} from 'mongoose';
const UserSchema = new Schema({

    name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    token:{
        type: String,
        default: null
    },
},{
    timestamps: true,
});

const User = mongoose.model('User', UserSchema);
export default User;
