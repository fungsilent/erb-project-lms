const form = document.querySelector('#login')
form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = document.querySelector('input[name="email"]')
    const password = document.querySelector('input[name="password"]')
    const data = {
        email: email.value,
        password: password.value,
    }
    console.log(data)
    const res = await fetchPost('/api/user/login', data)
    if (res.isSuccess) {
        window.location.href = '/dashboard'
    } else {
        const error = document.querySelector('.error')
        error.innerHTML = res.error
    }
})

const fetchPost = async (url, data) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    return response.json()
}