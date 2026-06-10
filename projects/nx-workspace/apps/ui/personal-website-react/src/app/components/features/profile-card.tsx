export function ProfileCard() {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <img
          id="profile-picture"
          src="/assets/profile-picture.jpg"
          className="transition-transform duration-300 hover:scale-105 shadow-lg"
          alt="Harry Liu"
        />
      </div>
      <h1 className="text-3xl font-bold mb-2">Harry Liu</h1>
      <p className="text-gray-600 dark:text-gray-400">I code sometimes.</p>
    </div>
  );
}
