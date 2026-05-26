interface Testimonials {
  name: string;
  image: string;
  subimage: string;
  category: string;
  description: string;
  subimagetwo: string;
}

const testimonials: Testimonials[] = [
  {
    image: "/assets/img/user/1.jpg",
    name: "Mariya Klinton",
    subimage: "/assets/img/icons/top-quotes.svg",
    subimagetwo: "/assets/img/icons/bottom-quotes.svg",
    category: "CEO",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy typesetting industry.",
  },
  {
    image: "/assets/img/user/2.jpg",
    subimage: "/assets/img/icons/top-quotes.svg",
    subimagetwo: "/assets/img/icons/bottom-quotes.svg",
    name: "John Doe",
    category: "General Manager",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy typesetting industry.",
  },
  {
    image: "/assets/img/user/3.jpg",
    subimage: "/assets/img/icons/top-quotes.svg",
    subimagetwo: "/assets/img/icons/bottom-quotes.svg",
    name: "Nency Lykra",
    category: "Marketing Manager",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy typesetting industry.",
  },
];
export default testimonials;
