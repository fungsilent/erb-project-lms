export const sendSuccess = (res, data) => {
    const json = {
        isSuccess: true,
        data,
    }
    res.json(json)
}

export const sendError = (res, error) => {
    const json = {
        isSuccess: false,
        error,
    }
    res.json(json)
}

export default {
    sendSuccess,
    sendError,
}