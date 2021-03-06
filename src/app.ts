import "dotenv/config";
import express, { Router, Request, Response, response } from "express";
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import { getSurvey, saveSurvey, updateSurvey } from "./persistence";
import { CreateSurveyPayload, JoinSurveyPayload, Survey } from "./types";

const app = express();
const survey = Router();
const jsonParser = bodyParser.json();

survey.use(jsonParser);

survey.post("/create", async (req, res) => {
  try {
    const payload = req.body;

    if (isCreateSurveyPayload(payload)) {
      const surveyId = nanoid();
      const creatorId = nanoid();

      const newSurvey: Survey = {
        surveyId,
        creatorId,
        name: payload.name,
        responses: [
          {
            respondentId: creatorId,
            pay: payload.pay,
            schedule: payload.schedule,
          },
        ],
      };

      await saveSurvey(newSurvey);

      res.send({
        surveyId,
        respondentId: creatorId,
      });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

survey.post("/:id/join", async (req, res) => {
  try {
    const payload = req.body;

    if (isJoinSurveyPayload(payload)) {
      const survey = await getSurvey(req.params.id);

      if (survey) {
        const respondentId = nanoid();

        const updatedSurvey: Survey = {
          ...survey,
          responses: [
            ...survey.responses,
            {
              respondentId,
              pay: payload.pay,
              schedule: payload.schedule,
            },
          ],
        };

        await updateSurvey(updatedSurvey);

        res.send({
          respondentId,
        });
      } else {
        res.send(404);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

survey.get("/:id", async (req, res) => {
  try {
    const survey = await getSurvey(req.params.id);

    // TODO: Need to sanitize the creator info
    // Currently able to tell the creator's pay based on response

    if (survey) {
      res.send(survey);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

// survey.delete("/:id", (req, res) => {
//   res.send(`delete survey ${req.params.id}`);
// });

// survey.post("/:id/remove", (req, res) => {
//   res.send(`vote to delete survey ${req.params.id}`);
// });

app.use("/survey", survey);
app.get("*", (req, res) => res.sendStatus(404));

export { app };

const isCreateSurveyPayload = (
  payload: any
): payload is CreateSurveyPayload => {
  return payload && payload.name && payload.pay && payload.schedule;
};

const isJoinSurveyPayload = (payload: any): payload is JoinSurveyPayload => {
  return payload && payload.pay && payload.schedule;
};
