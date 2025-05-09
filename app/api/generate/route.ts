import OpenAI, { APIError } from "openai";

const maxRetries = 3;
let attempts = 0;

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({ apiKey });

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const descriptionResponse = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct", // Or use the latest GPT model you prefer
    prompt: `Generate a detailed description based on the following prompt:\n${prompt}`,
    max_tokens: 150,
    temperature: 0.7,
  });
  const description =
    descriptionResponse.choices[0]?.text?.trim() || "No description available.";

  // Generate a title based on the description
  const titleResponse = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct", // Or use the latest GPT model
    prompt: `Generate a concise and informative title based on the following description:\n${description}\n\nTitle:`,
    max_tokens: 10,
    temperature: 0.7,
  });

  const title = titleResponse.choices[0]?.text?.trim() || "No title available.";

  console.log("Generated description:", description);
  console.log("Generated title:", title);

  // Retry logic in case of server errors
  while (attempts < maxRetries) {
    try {
      const response = await openai.images.generate({
        prompt,
        n: 1,
        size: "512x512",
      });

      if (response?.data?.[0]?.url) {
        return new Response(
          JSON.stringify({
            imageUrl: response.data[0].url,
            description,
            title,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } catch (error) {
      if (error instanceof APIError && error.status === 500) {
        attempts++;
        if (attempts >= maxRetries) {
          console.error("Max retries reached. Error:", error);
          return new Response(
            JSON.stringify({ error: "Server error. Please try again later." }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } else {
        console.error("Error:", error);
        return new Response(
          JSON.stringify({ error: "Something went wrong." }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  }
}
