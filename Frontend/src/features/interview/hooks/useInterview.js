import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context.js"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response?.interviewReport ?? null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
            setReport(null)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport ?? null
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
            setReports([])
        } finally {
            setLoading(false)
        }

        return response?.interviewReports ?? []
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let ignore = false

        const loadInterviewData = async () => {
            setLoading(true)

            try {
                if (interviewId) {
                    const response = await getInterviewReportById(interviewId)

                    if (!ignore) {
                        setReport(response.interviewReport)
                    }

                    return
                }

                const response = await getAllInterviewReports()

                if (!ignore) {
                    setReports(response.interviewReports)
                }
            } catch (error) {
                console.log(error)

                if (!ignore) {
                    if (interviewId) {
                        setReport(null)
                    } else {
                        setReports([])
                    }
                }
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        void loadInterviewData()

        return () => {
            ignore = true
        }
    }, [ interviewId, setLoading, setReport, setReports ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
