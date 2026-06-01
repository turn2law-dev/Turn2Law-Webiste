const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-body font-bold leading-tight">
            <span className="text-primary">Turn2Law</span>{" "}
            <span className="text-foreground">has helped</span>
            <br />
            <span className="text-foreground">hundreds of clients</span>
          </h2>
        </div>
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl h-80 bg-muted rounded-xl overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground font-body text-lg">Image</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
