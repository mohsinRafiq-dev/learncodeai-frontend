import React, { useState, useEffect } from "react";
import {
  getCertificateById,
  type Course,
  type CourseEnrollment,
} from "../../../functions/CourseFunctions/courseFunctions";
import { STORAGE_KEYS } from "../../../constants";

interface Certificate {
  _id: string;
  status: string;
  studentName?: string;
  issuedDate?: string;
  certificateId?: string;
  pdfUrl?: string;
  shareableUrl?: string;
}

interface CertificateViewerProps {
  enrollment: CourseEnrollment;
  course: Course;
  onBackToCourse: () => void;
}

const CertificateViewer: React.FC<CertificateViewerProps> = ({
  enrollment,
  course,
  onBackToCourse,
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificate = async () => {
      if (!enrollment.certificate) {
        setLoading(false);
        return;
      }

      try {
        const certificateId = typeof enrollment.certificate === 'string' 
          ? enrollment.certificate 
          : enrollment.certificate._id || JSON.stringify(enrollment.certificate);
        
        const response = await getCertificateById(certificateId);
        setCertificate(response.data as Certificate);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [enrollment.certificate]);

  const getCertificateStatus = () => {
    if (!enrollment.certificateIssued) {
      return {
        status: "pending",
        color: "yellow",
        icon: "⏳",
        title: "Certificate Pending",
        message:
          "Your certificate is being generated. Please wait for admin approval.",
      };
    }

    if (certificate?.approvalStatus === "approved") {
      return {
        status: "approved",
        color: "green",
        icon: "🏆",
        title: "Certificate Issued!",
        message:
          "Congratulations! Your certificate has been approved and is ready for download.",
      };
    }

    if (certificate?.approvalStatus === "rejected") {
      return {
        status: "rejected",
        color: "red",
        icon: "❌",
        title: "Certificate Not Approved",
        message:
          "Your certificate request was not approved. Please contact support for more information.",
      };
    }

    return {
      status: "pending",
      color: "yellow",
      icon: "⏳",
      title: "Certificate Pending Approval",
      message: "Your certificate is awaiting admin approval.",
    };
  };

  const handleDownloadCertificate = () => {
    if (certificate?.pdfUrl) {
      try {
        // Fetch the PDF as a blob to avoid ad blocker issues
        fetch(certificate.pdfUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || ""}`,
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch certificate');
            }
            return response.blob();
          })
          .then(pdfBlob => {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Create and open print window with embedded PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Certificate</title>
                  <style>
                    body { margin: 0; padding: 0; }
                    iframe { display: block; width: 100%; height: 100vh; border: none; }
                  </style>
                </head>
                <body>
                  <iframe src="${pdfUrl}"></iframe>
                  <script>
                    setTimeout(function() {
                      window.print();
                    }, 500);
                  </script>
                </body>
                </html>
              `);
              printWindow.document.close();
            }
          })
          .catch(() => {
            alert('Failed to open certificate for printing');
          });
      } catch {
        alert('Failed to open certificate for printing');
      }
    }
  };

  const handleShareCertificate = () => {
    if (certificate?.shareableUrl) {
      navigator.clipboard.writeText(certificate.shareableUrl);
      alert("Certificate link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading certificate...</p>
        </div>
      </div>
    );
  }

  const statusInfo = getCertificateStatus();
  const colorClasses = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      button: "bg-green-600 hover:bg-green-700",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      button: "bg-red-600 hover:bg-red-700",
    },
  };

  const colors = colorClasses[statusInfo.color as keyof typeof colorClasses];

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      {/* Status Banner */}
      <div
        className={`rounded-2xl shadow-lg p-8 border mb-6 ${colors.bg} ${colors.border}`}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h2 className={`text-3xl font-bold mb-2 ${colors.text}`}>
            {statusInfo.title}
          </h2>
          <p className={`text-lg ${colors.text}`}>{statusInfo.message}</p>
        </div>
      </div>

      {/* Course Completion Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Course Completion Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Course Title</p>
              <p className="text-lg font-semibold text-gray-900">
                {course.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="text-lg font-semibold text-gray-900">
                {course.instructor?.name || 'Unknown Instructor'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {enrollment.completionDate
                  ? new Date(enrollment.completionDate).toLocaleDateString()
                  : enrollment.status === "completed"
                  ? new Date().toLocaleDateString()
                  : "In Progress"}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {enrollment.overallProgress}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Final Quiz Score</p>
              <p className="text-lg font-semibold text-gray-900">
                {enrollment.finalQuizScore?.score !== undefined
                  ? `${enrollment.finalQuizScore.score}%`
                  : enrollment.status === "completed"
                  ? "100%"
                  : "Not Taken"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Certificate Template</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {course.certificateTemplate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Preview (if approved) */}
      {certificate?.status === "approved" && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Certificate Preview
          </h3>
          <div className="border-4 border-amber-400 rounded-xl p-12 bg-gradient-to-br from-amber-50 to-yellow-50">
            <div className="text-center">
              <div className="text-6xl mb-6">🎓</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Certificate of Completion
              </h1>
              <p className="text-lg text-gray-700 mb-6">This certifies that</p>
              <p className="text-3xl font-bold text-indigo-600 mb-6">
                {certificate.studentName || "Student Name"}
              </p>
              <p className="text-lg text-gray-700 mb-4">
                has successfully completed the course
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-8">
                {course.title}
              </p>
              <div className="flex justify-between items-end">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Issued Date</p>
                  <p className="font-semibold text-gray-900">
                    {certificate.issuedDate
                      ? new Date(certificate.issuedDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Certificate ID</p>
                  <p className="font-mono text-sm text-gray-900">
                    {certificate.certificateId || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="font-semibold text-gray-900">
                    {course.instructor?.name || 'Unknown Instructor'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onBackToCourse}
          className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-lg transition-colors"
        >
          Back to Course
        </button>

        {certificate?.status === "approved" && (
          <>
            <button
              onClick={handleDownloadCertificate}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              🖨️ Print Certificate
            </button>
            <button
              onClick={handleShareCertificate}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-lg transition-colors"
            >
              Share Certificate
            </button>
          </>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="font-semibold text-blue-900 mb-2">
          ℹ️ About Your Certificate
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Certificates are reviewed and approved by administrators within
            24-48 hours.
          </li>
          <li>
            • Once approved, you'll receive an email notification with download
            instructions.
          </li>
          <li>
            • Your certificate is permanently stored and can be accessed anytime
            from your profile.
          </li>
          <li>
            • You can share your certificate via a unique link or download it as
            a PDF.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CertificateViewer;

