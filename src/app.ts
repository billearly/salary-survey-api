import "dotenv/config";
import express, { Router } from "express";
import cors, { CorsOptions } from 'cors';
import bodyParser from "body-parser";
import { nanoid } from "nanoid";
import { DateTime, Duration } from 'luxon';
import { getSurvey, saveSurvey, updateSurvey } from "./persistence";
import { CreateSurveyPayload, JoinSurveyPayload, Survey } from "./types";
import { mapSurveyToView } from "./map";

const app = express();
const survey = Router();
const jsonParser = bodyParser.json();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: [
    'DELETE',
    'GET',
    'HEAD',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT'
  ],
  allowedHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Respondent-ID'
  ]
}

survey.use(jsonParser);

survey.post("/create", async (req, res) => {
  try {
    const payload = req.body;

    if (isCreateSurveyPayload(payload)) {
      const surveyId = nanoid();
      const creatorId = nanoid();

      const HOURS_24: Duration = Duration.fromObject({
        hours: 24
      });

      const creationDate = DateTime.utc().set({
        second: 0,
        millisecond: 0
      });

      const expirationDate = creationDate.plus(HOURS_24);

      const newSurvey: Survey = {
        surveyId,
        creationDate,
        expirationDate,
        creatorId,
        name: payload.name,
        minNumberResponses: payload.minNumberResponses,
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
        expirationDate
      });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

survey.post("/:id/join", async (req, res) => {
  try {
    const payload = req.body;

    if (isJoinSurveyPayload(payload)) {
      const survey = await getSurvey(req.params.id);

      if (survey && isSurveyActive(survey)) {
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

    if (survey && isSurveyActive(survey)) {
      const myRespondentId = req.headers["x-respondent-id"];

      if (Array.isArray(myRespondentId)) {
        throw new Error("invalid x-respondent-id header");
      }

      const mappedSurvey = mapSurveyToView(survey, myRespondentId);

      res.send(mappedSurvey);
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

app.use(cors(corsOptions));
app.use("/survey", survey);
app.get("*", (req, res) => res.sendStatus(404));

export { app };

const isSurveyActive = (survey: Survey): boolean => {
  return survey.expirationDate >= DateTime.now();
}

const isCreateSurveyPayload = (
  payload: any
): payload is CreateSurveyPayload => {
  return payload && payload.name && payload.pay && payload.schedule && payload.minNumberResponses;
};

const isJoinSurveyPayload = (payload: any): payload is JoinSurveyPayload => {
  return payload && payload.pay && payload.schedule;
};
