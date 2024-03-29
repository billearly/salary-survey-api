import { DateTime } from "luxon";

export type Survey = {
  surveyId: string;
  creationDate: DateTime;
  expirationDate: DateTime;
  creatorId: string;
  name: string;
  minNumberResponses: number;
  responses: SurveyResponse[];
};

export type SurveyResponse = {
  respondentId: string;
  pay: number;
  schedule: PaySchedule;
};

export type SurveyView = {
  surveyId: string;
  creationDate: DateTime;
  expirationDate: DateTime;
  name: string;
  minNumberResponses: number;
  responses: SurveyResponseView[];
}

export type SurveyResponseView = {
  isMyResponse: boolean;
  pay: number;
  schedule: PaySchedule;
}

export type CreateSurveyPayload = {
  name: string;
  pay: number;
  minNumberResponses: number;
  schedule: PaySchedule;
};

export type JoinSurveyPayload = {
  pay: number;
  schedule: PaySchedule;
};

export enum PaySchedule {
  HOURLY = "HOURLY", // * 40 * 52
  WEEKLY = "WEEKLY", // * 52
  EVERY_OTHER_WEEK = "EVERY_OTHER_WEEK", // * 26
  TWICE_A_MONTH = "TWICE_A_MONTH", // * 24
  MONTHLY = "MONTHLY", // * 12
  YEARLY = "YEARLY", // * 1
}
