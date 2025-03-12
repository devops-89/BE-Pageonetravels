import * as bcrypt from 'bcrypt';

export const generatePasswordHash = async (password: string) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    } catch (err) {
        throw err;
    }
}

export const checkPasswordHash = async (password: string, hash: string) => {
    try 
    { 
        return await bcrypt.compare(password, hash);
    } 
    catch (err) {
        console.log(" becrypt error check password error",err);
        return false;
    }
}