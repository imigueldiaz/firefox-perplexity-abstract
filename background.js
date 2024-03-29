/**
 * @param {string} apiKey
 * @param {string} model
 * @param {number} temperature
 * @param {string} content
 * @param {string} language
 * @returns {Promise<any>}
 * Call the Perplexity API with the provided parameters.
 * Return a promise that resolves with the API response.
 */
function callPerplexityAPI(apiKey, model, temperature, content, language) {
  const systemPrompt = `You are an AI assistant that generates concise, high-quality abstracts and keywords for webpage content.

Instructions:
1. Analyze the provided webpage text and identify the main topics, key points and overall meaning. Take account of the language of the webpage. The ISO code of the language should be detected and if it is not it will be '${language}'.
2. Generate an abstract in the SAME LANGUAGE as the webpage content. This is crucial. If the webpage is in Spanish, the abstract MUST be in Spanish. If the webpage is in French, the abstract MUST be in French, and so on.
3. The abstract should:
   - Accurately and concisely summarize the key information in 1-2 paragraphs
   - Be well-written, precise and easy to understand
   - Contain the most important points without extraneous details
   - Be formatted as 1-2 easily readable paragraphs of plain text, each formatted as <p class="abstractp">{paragraph text}</p> WITHOUT MARKDOWN OR SPECIAL CHARACTERS
4. Extract the most relevant keywords from the text that capture the main topics and themes.
5. Format the output as follows, including the abstract and keywords, the final output MUST BE a valid HTML node with NO MARKDOWN at all:
<div class="abstract" lang="{ISO code of the detected language}">{abstract}</div>
<div class="keywords">{foreach keyword in keywords: <span class="keyword">{keyword}</span> }</div>

Begin!`;


  // Set the options for the fetch call
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: content}
      ],
      temperature: temperature
    })
  };

  return fetch('https://api.perplexity.ai/chat/completions', options)
    .then(response => response.json())
    .catch(err => console.error(err));
}

// Listen for messages from the popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CALL_API') {
    callPerplexityAPI(message.apiKey, message.model, message.temperature, message.content).then(response => {
      sendResponse({data: response});
    });
    return true; // Return true to indicate async response
  }
});
