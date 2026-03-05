export default function ModalSteps({ currentStep, steps }) {
  const stepClass = (index) =>
    `step ${currentStep >= index + 1 ? "step-primary" : ""}`;

  return (
    <ul className="steps w-full px-6 pt-4">
      {steps.map((step, index) => (
        <li key={index} className={stepClass(index)}>
          {step}
        </li>
      ))}
    </ul>
  );
}