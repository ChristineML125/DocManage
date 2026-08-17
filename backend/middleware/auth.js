import jwt from "jsonwebtoken"

export function authenticate(req, res,next){
    const authHeader = req.headers.authorization;
    const cookieToken = req.headers.cookie
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('access_token='))
        ?.split('=')[1];

    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : cookieToken;

    if(!token){
        return res.status(401).json({
            success: false,
            message: "No Token Provide"
        });
    }

    try{
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (err){
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}
