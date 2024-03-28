import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const data = req.body;
    let expectedNumberOfPeople: number;

    if (!data.employee || typeof data.employee !== 'string') {
      return res.status(400).json({ error: 'Please select a valid employee.' });
    }

    if (!Number.isInteger(data.numberOfChildren) || data.numberOfChildren < 0) {
      return res.status(400).json({ error: 'Number of children must be a number.' });
    }

    if (!Number.isInteger(data.numberOfChildrenOver18) || data.numberOfChildrenOver18 < 0) {
      return res.status(400).json({ error: 'Number of children over 18 must be a number.' });
    }

    if (!Number.isInteger(data.numberOfPeopleArriving) || data.numberOfPeopleArriving <= 0) {
      return res.status(400).json({ error: 'Number of people arriving must be a number.' });
    }

    if (data.spouseJoining) {
      expectedNumberOfPeople = data.numberOfChildren + 2;
    } else {
      expectedNumberOfPeople = data.numberOfChildren + 1;
    }
    if (data.numberOfPeopleArriving !== expectedNumberOfPeople) {
      return res.status(400).json({ error: 'Number of people arriving must be equal to the total number of individuals.' });
    }

    if (!Number.isInteger(data.transportationNeeded) || data.transportationNeeded < 0) {
      return res.status(400).json({ error: 'Transportation needed must be a non-negative integer or 0.' });
    }
    return res.status(200).json({ message: 'Validation successful!' });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}