export default function ModalSteps({ currentStep, steps, colorMode = "light" }) {
  const stepClass = (index) =>
    `step ${currentStep >= index + 1 ? "step-primary" : ""}`;
  const listClassName = `steps w-full px-6 pt-4 ${
    colorMode === "dark" ? "userpool-steps-dark text-[#cbb8bd]" : ""
  }`;

  return (
    <ul className={listClassName}>
      {steps.map((step, index) => (
        <li key={index} className={stepClass(index)}>
          {step}
        </li>
      ))}
    </ul>
  );
}