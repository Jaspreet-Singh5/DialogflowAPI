const express = require('express')
const app = express()
const cors = require('cors')  //use this

app.use(cors()) //and this

// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

const projectId = 'qutrain';
const sessionId = '123456';
const queries = [
    // 'Hi, I would like to know my credit card bill.',
    // 'Yes, it’s 9999912345', // Sure. Can you please provide me your registered phone number?
    // 'Yeah it’s 432210',  // Thanks, You will receive an OTP number which is sent to your registered phone number. Can you please confirm that as well?
    // 'Sure, it’s 01752', // Great! Lastly, can you please confirm your zip code?
    // 'No, I am good.' // Is there anything else can I help you with?
]
const languageCode = 'en';

// Instantiate a session client
const sessionClient = new dialogflow.SessionsClient();

async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );
    
    // The text query request
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode
            }
        }
    }

    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts
        }
    }

    const responses = await sessionClient.detectIntent(request)
    return responses[0];
}

async function executeQueries(
    projectId,
    sessionId,
    queries,
    languageCode
) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Sending Query: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Detected intent');
            console.log(`Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`)
            // Use the context from this response for next queries
            context = intentResponse.queryResult.outputContexts;

            return `${intentResponse.queryResult.fulfillmentText}`;
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}

// executeQueries(projectId, sessionId, queries, languageCode)


app.use(express.json())

async function getData(userTextResponse) {
    return await executeQueries(projectId, sessionId, [userTextResponse], languageCode);
}

app.post('/query', (req, res) => {
    console.log(req.body.userTextResponse)
    console.log('query')
    
    getData(req.body.userTextResponse)
        .then((response) => {
            console.log(response)
            res.send(response)
        })
})

app.get('/', (req, res) => {
    res.send("Server Is Working......")
})


const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
