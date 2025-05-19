import React from 'react';

interface AnatomicalDiagramProps {
  selectedAreas: string[];
  onAreaSelect: (area: string) => void;
}

const AnatomicalDiagram: React.FC<AnatomicalDiagramProps> = ({ 
  selectedAreas, 
  onAreaSelect 
}) => {
  const anatomicalAreas = [
    { id: 'tete', label: 'Tête', x: 50, y: 10, radius: 5 },
    { id: 'cou', label: 'Cou', x: 50, y: 20, radius: 4 },
    { id: 'epaule_gauche', label: 'Épaule gauche', x: 35, y: 30, radius: 4 },
    { id: 'epaule_droite', label: 'Épaule droite', x: 65, y: 30, radius: 4 },
    { id: 'haut_dos', label: 'Haut du dos', x: 50, y: 35, radius: 4 },
    { id: 'bras_gauche', label: 'Bras gauche', x: 25, y: 40, radius: 4 },
    { id: 'bras_droit', label: 'Bras droit', x: 75, y: 40, radius: 4 },
    { id: 'bas_dos', label: 'Bas du dos', x: 50, y: 50, radius: 4 },
    { id: 'bassin', label: 'Bassin', x: 50, y: 60, radius: 4 },
    { id: 'jambe_gauche', label: 'Jambe gauche', x: 35, y: 75, radius: 4 },
    { id: 'jambe_droite', label: 'Jambe droite', x: 65, y: 75, radius: 4 },
    { id: 'pied_gauche', label: 'Pied gauche', x: 35, y: 90, radius: 4 },
    { id: 'pied_droit', label: 'Pied droit', x: 65, y: 90, radius: 4 },
    { id: 'abdomen', label: 'Abdomen', x: 50, y: 45, radius: 4 },
    { id: 'thorax', label: 'Thorax', x: 50, y: 35, radius: 4 },
    { id: 'main_gauche', label: 'Main gauche', x: 20, y: 45, radius: 3 },
    { id: 'main_droite', label: 'Main droite', x: 80, y: 45, radius: 3 },
    { id: 'genou_gauche', label: 'Genou gauche', x: 35, y: 80, radius: 3 },
    { id: 'genou_droit', label: 'Genou droit', x: 65, y: 80, radius: 3 },
  ];

  return (
    <div className="flex flex-col items-center h-full">
      <div className="relative h-[150px] w-[120px] mx-auto overflow-visible">
        {/* Simple body outline for reference */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[45%] h-[120px] w-[35px] border-2 border-gray-300 rounded-full opacity-10"></div>
        
        {/* Clickable areas */}
        {anatomicalAreas.map((area) => (
          <button
            key={area.id}
            type="button"
            onClick={() => onAreaSelect(area.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-colors ${
              selectedAreas.includes(area.id)
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: `${area.radius * 2}px`,
              height: `${area.radius * 2}px`,
              fontSize: '10px'
            }}
            title={area.label}
          >
            {area.id.charAt(0).toUpperCase()}
          </button>
        ))}
      </div>
      
    </div>
  );
};

export default AnatomicalDiagram;
