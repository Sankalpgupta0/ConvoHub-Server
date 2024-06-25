import Group from "../models/GroupModel.js"

const getGroups = async (currentUserId) => {
    if (currentUserId) {
        const groups = await Group.find(
            {
                members: currentUserId
            }
        ).sort({ updatedAt: -1 }).populate('messages').populate('members')

        // console.log("groups : ", groups)
        const userGroups = groups.map((group) => {
            const countUnseenMsg = group?.messages?.reduce((preve, curr) => {
                const msgByUserId = group?.msgByUserId?.toString()

                if (msgByUserId !== currentUserId) {
                    return preve + (curr?.seen ? 0 : 1)
                } else {
                    return preve
                }

            }, 0)

            return {
                _id: group?._id,
                name: group?.name,
                members: group?.members,
                admin: group?.admin,
                profile_pic: group?.profile_pic,
                unseenMsg: countUnseenMsg,
                lastMsg: group.messages[group?.messages?.length - 1]
            }
        })
        return userGroups
    } else {
        return []
    }
}
export default getGroups