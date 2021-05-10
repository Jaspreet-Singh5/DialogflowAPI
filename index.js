const express = require('express')
const app = express()
// Imports the Dialogflow library
const dialogflow = require('@google-cloud/dialogflow');

const projectId = 'qutrain';
const sessionId = '123456';
const queries = [
    'Hi',
    'What is your name?', // Tell the bot when the meeting is taking place
    'B',  // Rooms are defined on the Dialogflow agent, default options are A, B, or C 
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
        } catch (error) {
            console.log(error);
        }
    }
}

executeQueries(projectId, sessionId, queries, languageCode)

app.use(express.json())


app.get('/', (req, res) => {
    res.send("Server Is Working......")
})


/**
* now listing the server on port number 3000 :)
* */
app.listen(80, () => {
    console.log("Server is Running on port 80")
})