import * as Yup from 'yup'

const dayFormatRegex =
  /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s([1-9]|[12][0-9]|3[01])\s(January|February|March|April|May|June|July|August|September|October|November|December)$/

export const appointmentSchema = Yup.object().shape({
  day: Yup.string()
    .matches(dayFormatRegex, 'Format must be like "Tuesday 12 May"')
    .required('Day is required to set appointment.')
})
