const localIdService = () => {

    let userId = null;

    const getUserId = () => {
        if (userId){
            return userId;
        } else {
            let userIdStor = null;
            try {
                userIdStor = localStorage.getItem("userId");
            } catch (e) {}
            console.log(userIdStor);
            if (userIdStor){
                userId = userIdStor;
                return userId;
            } else {
                userId = createUserId();
                localStorage.setItem("userId", userId);
                return userId

            }
        }
    }

    const createUserId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            // eslint-disable-next-line
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    return getUserId();
    
}
export default localIdService