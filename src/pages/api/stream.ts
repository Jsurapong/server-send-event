// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const interval = setInterval(() => {
    const randomNumber = Math.floor(Math.random() * 100); // Generate a random number between 0 and 99
    const datetime = new Date();

    // res.write(`data: ${randomNumber}\n\n`);
    const event = {
      name: "message",
      data: JSON.stringify({
        dt: datetime.toISOString(),
        value: randomNumber,
      }),
      id: randomNumber,
    };

    const eventString = `event: ${event.name}\ndata: ${event.data}\nid: ${event.id}\n\n`;
    res.write(eventString);
    res.flush();
  }, 1000);

  // Handle connection close
  res.on("close", () => {
    clearInterval(interval);
  });
}
