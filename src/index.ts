import express, { Express, Response, Request } from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import corsOptions from './middlewares/cors';
import { errorHandler, notFound } from './middlewares/error';
dotenv.config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const port: number = +process.env.PORT! || 4000;
const app: Express = express()
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(helmet())
app.use(cors(corsOptions))
app.use(morgan('combined'))
app.post("/", async (req: Request, res: Response) => {
    const { message }: { message: string } = req.body
    if (message === "") {
        return res.status(400).json({
            message: 'Message is required!'
        })
    }
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: message
        });
        return res.status(200).json(completion.data.choices[0].text)
    } catch (error: any) {
        if (error.response) {
            return res.status(500).json(error.response.data)
        } else {
            return res.status(500).json(error.message)
        }
    }
})
app.use(notFound);
app.use(errorHandler);
app.listen(port, (): void => {
    console.log(`Server listening on http://localhost:${port}`)
}).on('error', (error: Error) => {
    console.log(error)
})