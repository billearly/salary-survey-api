import { connect, model, Schema } from "mongoose";
import { Survey, SurveyResponse } from "./types";

type MongoConnection = typeof import("mongoose");
let connection: MongoConnection;

export const connectDb = async () => {
  if (!process.env.MONGO_DB_URL) {
    throw new Error("MONGO_DB_URL not set");
  }

  if (!connection) {
    connection = await connect(process.env.MONGO_DB_URL);
  }
};

export const saveSurvey = async (survey: Survey): Promise<void> => {
  try {
    const surveyModel = new SurveyModel(survey);
    await surveyModel.save();
  } catch (e) {
    console.error(e);
  }
};

export const getSurvey = async (surveyId: string): Promise<Survey> => {
  try {
    const model = await SurveyModel.findOne({ surveyId });
    const survey = model?.toObject();
    return survey;
  } catch (e) {
    console.error(e);
    // need to return something?
  }
};

export const updateSurvey = async (survey: Survey): Promise<void> => {
  try {
    await SurveyModel.findOneAndUpdate({ surveyId: survey.surveyId }, survey);
  } catch (e) {
    console.error(e);
    // need to handle this
  }
};

const SurveyResponseSchema = new Schema<SurveyResponse>(
  {
    respondentId: String,
    pay: Number,
    schedule: String,
  },
  { _id: false }
);

const SurveySchema = new Schema<Survey>({
  surveyId: String,
  creatorId: String,
  name: String,
  responses: [SurveyResponseSchema],
});

const SurveyModel = model<Survey>("Survey", SurveySchema);
