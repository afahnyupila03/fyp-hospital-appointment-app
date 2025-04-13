/* 
export const signupHandler = async (userData) => {
    try {
        const response = await fetch ('http://localhost:4000/admin/register', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })

        const result = await response.json()

        if (!response.ok) throw new Error(result.message)


    
} */