import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

const query = async (text) => {
    try {
        const chatResponse = await client.chat.complete({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: text }],
        });

        return chatResponse.choices[0].message.content;
    } catch (error) {
        return error.message;
    }
};

const getAIReview = async (pullRequest) => {

    const title = pullRequest.title;
    const description = pullRequest.description;
    const changedFiles = pullRequest.changed_files;
    const additions = pullRequest.additions;
    const deletions = pullRequest.deletions;

    const reqDiff = await fetch(pullRequest.diff_url);
    const diff = await reqDiff.text();

    const prompt = `A Github pull request titled '${title}' has been made with the following description:
'${description}'.

The PR includes '${changedFiles}' files changed, with '${additions}' additions and '${deletions}' deletions.

Here is the diff for the changes:
'${diff}'

Please review the code changes and suggest improvements.`

    return await query(prompt);
}

export default getAIReview;