// export const sendSuccess = (res, data) => {
//     const json = {
//         isSuccess: true,
//         data,
//     }
//     res.json(json)
// }

// export const sendError = (res, error) => {
//     const json = {
//         isSuccess: false,
//         error,
//     }
//     res.json(json)
// }

// export default {
//     sendSuccess,
//     sendError,
// }

export default {
    sendError: (res, message) => {
        res.status(400).json({ success: false, message })
    },
    sendSuccess: (res, data = {}) => {
        res.status(200).json({ success: true, data })
    }
}