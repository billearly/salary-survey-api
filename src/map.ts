import { PaySchedule, Survey, SurveyResponse, SurveyView } from "./types";

export const mapSurveyToView = (survey: Survey, myRespondentId: string | undefined): SurveyView => {
  const hasResponded = hasRespondedToThisSurvey(survey.responses, myRespondentId);

  return {
    surveyId: survey.surveyId,
    name: hasResponded ? survey.name : '',
    minNumberResponses: survey.minNumberResponses,
    responses: survey.responses.map(response => {
      if (!hasResponded || survey.responses.length < survey.minNumberResponses) {
        return {
          isMyResponse: false,
          pay: 0,
          schedule: PaySchedule.HOURLY
        }
      }

      return {
        isMyResponse: response.respondentId === myRespondentId,
        pay: response.pay,
        schedule: response.schedule
      }
    })
  }
}

const hasRespondedToThisSurvey = (responses: SurveyResponse[], myRespondentId: string | undefined): boolean => {
  return !!responses.find(res => res.respondentId === myRespondentId);
}
