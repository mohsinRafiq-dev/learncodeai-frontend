export default function Testimonial() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-gray-900">
          <img src="/assets/homePage/QuoteLeft.svg" className="mb-8" />
          <p className="text-4xl font-bold mb-8 leading-tight text-justify sm:text-center lg:text-justify">
            LearnCode AI feels like learning with a mentor. The tutorials, AI
            Copilot, and instant feedback keep me motivated and improving every
            day.
          </p>
          <div className="max-lg:flex max-lg:items-center max-lg:justify-center">
            <div className="flex items-center">
              <img
                src="/assets/homePage/Avatar.png"
                alt="Muhammad Saad"
                className="w-16 h-16 rounded-full mr-4 object-cover"
              />
              <div>
                <p className="font-semibold text-lg">Muhammad Saad</p>
                <p className="text-gray-600 text-sm">
                  Software Engineering Student - LearnCode AI Learner
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:justify-end">
          <img
            src="/assets/homePage/TestimonialPic.png"
            alt="Person coding at a desk with abstract diagrams"
            className="rounded-lg shadow-lg max-h-[500px] ml-auto"
          />
        </div>
      </div>
    </section>
  );
}
