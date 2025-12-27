import React, { useState } from "react";
import { Mail, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  submitContactForm,
  validateField,
  getInitialFormData,
  type ContactFormData,
} from "../../functions/FormFunctions/contactFunctions";

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(getInitialFormData());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }

    if (touched[name]) {
      const error = validateField(name as keyof ContactFormData, value);
      setErrors({
        ...errors,
        [name]: error || "",
      });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    const error = validateField(name as keyof ContactFormData, value);
    setErrors({
      ...errors,
      [name]: error || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      subject: true,
      message: true,
    });

    const newErrors: { [key: string]: string } = {};
    (Object.keys(formData) as Array<keyof ContactFormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({
        type: "error",
        message: "Please fix the errors before submitting",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await submitContactForm(formData);

      if (response.status === "success") {
        setSubmitStatus({
          type: "success",
          message:
            response.message ||
            "Message sent successfully! We'll get back to you soon.",
        });
        setFormData(getInitialFormData());
        setTouched({});
        setErrors({});
      } else {
        setSubmitStatus({
          type: "error",
          message: response.message || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e27] py-12 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Terminal Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 neon-border-cyan backdrop-blur-xl bg-[#1a1f3a]/50 rounded-lg mb-6">
            <span className="text-[#00b4d8] font-mono text-sm animate-pulse">●</span>
            <span className="text-[#00b4d8] font-mono text-sm font-medium">Contact.init()</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-[#6272a4]">{"// "}</span>
            <span className="neon-text-cyan">Get</span>
            <span className="text-white"> in </span>
            <span className="neon-text-purple">Touch</span>
          </h1>
          <p className="text-[#6272a4] max-w-2xl mx-auto text-base md:text-lg">
            <span className="text-[#00b4d8]">{"/* "}</span>
            We'd love to hear from you. Fill out the form or reach out via email
            <span className="text-[#00b4d8]">{" */"}</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Left Column - Contact Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="terminal-window p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-[#00b4d8] mb-6">
                {"{ "}<span className="text-white">contact_info</span>{" }"}
              </h2>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-[#00b4d8]/10 neon-border-cyan rounded-lg">
                    <Mail className="w-5 h-5 text-[#00b4d8]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#6272a4] text-sm mb-1">{"// Email"}</p>
                    <p className="text-white">support@learncodeai.io</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="p-3 bg-[#8b5cf6]/10 neon-border-purple rounded-lg">
                    <MapPin className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#6272a4] text-sm mb-1">{"// Location"}</p>
                    <p className="text-white">123 Tech Avenue<br />Silicon Valley, CA</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#00e676] mb-4">
                  {"[ "}<span className="text-white">follow_us</span>{" ]"}
                </h3>
                <div className="flex gap-4">
                  <button className="group flex flex-col items-center gap-2 p-3 bg-[#1a1f3a] neon-border-cyan rounded-lg hover:bg-[#1a1f3a]/80 transition-all">
                    <svg className="w-6 h-6 text-[#00b4d8] group-hover:text-[#00e676] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[#6272a4] text-xs">Github</span>
                  </button>

                  <button className="group flex flex-col items-center gap-2 p-3 bg-[#1a1f3a] neon-border-purple rounded-lg hover:bg-[#1a1f3a]/80 transition-all">
                    <svg className="w-6 h-6 text-[#8b5cf6] group-hover:text-[#00e676] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    <span className="text-[#6272a4] text-xs">Twitter</span>
                  </button>

                  <button className="group flex flex-col items-center gap-2 p-3 bg-[#1a1f3a] neon-border-green rounded-lg hover:bg-[#1a1f3a]/80 transition-all">
                    <svg className="w-6 h-6 text-[#00e676] group-hover:text-[#00b4d8] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="text-[#6272a4] text-xs">LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="md:col-span-3">
            <div className="terminal-window p-8 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#00b4d8]/20">
                <div className="w-3 h-3 rounded-full bg-[#e91e63]"></div>
                <div className="w-3 h-3 rounded-full bg-[#00e676]"></div>
                <div className="w-3 h-3 rounded-full bg-[#00b4d8]"></div>
                <span className="ml-2 text-[#6272a4] font-mono text-sm">send_message.form</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Success/Error Message */}
                {submitStatus.type && (
                  <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                    submitStatus.type === "success"
                      ? "bg-[#00e676]/10 border-[#00e676]/30"
                      : "bg-[#e91e63]/10 border-[#e91e63]/30"
                  }`}>
                    {submitStatus.type === "success" ? (
                      <CheckCircle className="w-5 h-5 text-[#00e676] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[#e91e63] flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      submitStatus.type === "success" ? "text-[#00e676]" : "text-[#e91e63]"
                    }`}>
                      {submitStatus.message}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-[#00b4d8] mb-2">
                    <span className="text-[#6272a4]">{"const "}</span>fullName <span className="text-[#e91e63]">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 bg-[#1a1f3a] border rounded-lg focus:ring-2 focus:outline-none transition font-mono text-white placeholder-[#6272a4] ${
                      touched.fullName && errors.fullName
                        ? "border-[#e91e63] focus:ring-[#e91e63]/50"
                        : "border-[#00b4d8]/30 focus:ring-[#00b4d8]/50 focus:border-[#00b4d8]"
                    }`}
                  />
                  {touched.fullName && errors.fullName && (
                    <p className="text-[#e91e63] text-sm mt-1">{"// "}{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#8b5cf6] mb-2">
                    <span className="text-[#6272a4]">{"const "}</span>email <span className="text-[#e91e63]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 bg-[#1a1f3a] border rounded-lg focus:ring-2 focus:outline-none transition font-mono text-white placeholder-[#6272a4] ${
                      touched.email && errors.email
                        ? "border-[#e91e63] focus:ring-[#e91e63]/50"
                        : "border-[#8b5cf6]/30 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]"
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-[#e91e63] text-sm mt-1">{"// "}{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-[#00e676] mb-2">
                    <span className="text-[#6272a4]">{"const "}</span>subject <span className="text-[#e91e63]">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Question about algorithms"
                    className={`w-full px-4 py-3 bg-[#1a1f3a] border rounded-lg focus:ring-2 focus:outline-none transition font-mono text-white placeholder-[#6272a4] ${
                      touched.subject && errors.subject
                        ? "border-[#e91e63] focus:ring-[#e91e63]/50"
                        : "border-[#00e676]/30 focus:ring-[#00e676]/50 focus:border-[#00e676]"
                    }`}
                  />
                  {touched.subject && errors.subject && (
                    <p className="text-[#e91e63] text-sm mt-1">{"// "}{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#00d4ff] mb-2">
                    <span className="text-[#6272a4]">{"const "}</span>message <span className="text-[#e91e63]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Your message here..."
                    rows={5}
                    className={`w-full px-4 py-3 bg-[#1a1f3a] border rounded-lg focus:ring-2 focus:outline-none transition resize-none font-mono text-white placeholder-[#6272a4] ${
                      touched.message && errors.message
                        ? "border-[#e91e63] focus:ring-[#e91e63]/50"
                        : "border-[#00d4ff]/30 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff]"
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p className="text-[#e91e63] text-sm mt-1">{"// "}{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#00b4d8] via-[#8b5cf6] to-[#00e676] rounded-lg blur-lg transition-opacity ${
                    isSubmitting ? "opacity-50" : "opacity-75 group-hover:opacity-100"
                  }`}></div>
                  <div className={`relative w-full px-8 py-4 bg-[#0a0e27] neon-border-cyan rounded-lg font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                    isSubmitting ? "cursor-not-allowed" : "hover:bg-[#1a1f3a]"
                  }`}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-[#00b4d8]" />
                        <span className="text-[#6272a4]">Sending...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[#00e676]">$</span>
                        <span className="text-[#00b4d8]">send_message</span>
                        <span className="text-[#6272a4]">()</span>
                      </>
                    )}
                  </div>
                </button>

                <p className="text-center text-[#6272a4] text-sm mt-4">
                  <span className="text-[#00b4d8]">{"// "}</span>
                  We'll get back to you as soon as possible
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
