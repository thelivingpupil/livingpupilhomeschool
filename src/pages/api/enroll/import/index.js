import { processUser } from "./processUser";

const handler = async (req, res) => {
 try {
    const data = await processUser({email: 'babydaughson@gmail.com', firstName: 'KHLOE COLLEEN '})

    res.status(200).json({ message: 'Successful import', data });
 } catch (error) {
    res.status(400).json({
      error
    })
 }
}

export default handler;
