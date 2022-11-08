import { Survey, SurveyResponse, SurveyResponseView, SurveyView } from "./types";

export const mapSurveyToView = (survey: Survey, myRespondentId: string): SurveyView => {
  return {
    surveyId: survey.surveyId,
    name: survey.name,
    minNumberResponses: survey.minNumberResponses,
    responses: survey.responses.map(response => mapResponseToView(response, myRespondentId))
  }
}

const mapResponseToView = (surveyResponse: SurveyResponse, myRespondentId: string): SurveyResponseView => {
  return {
    isMyResponse: surveyResponse.respondentId === myRespondentId,
    pay: surveyResponse.pay,
    schedule: surveyResponse.schedule
  }
}
