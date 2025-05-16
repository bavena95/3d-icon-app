import Image from "next/image"

export default function StyleExamples() {
  const styles = [1, 2, 3, 4]

  return (
    <div className="flex flex-col space-y-3">
      {styles.map((style) => (
        <div key={style} className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-white">
          <Image
            src={`/placeholder-style-${style}.png`}
            alt={`Estilo ${style}`}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
