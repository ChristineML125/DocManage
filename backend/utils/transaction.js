import {getPool, sql} from "../config/db.js";

export async function withTransaction(callback){
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try{
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    }catch(error){
        await transaction.rollback();
        throw error;
    }
}