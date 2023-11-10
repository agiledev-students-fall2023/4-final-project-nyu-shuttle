const nycCoordinates = [
  [-73.935242, 40.73061], // Manhattan
  [-73.944158, 40.678178], // Brooklyn
  [-73.794851, 40.728224], // Queens
  [-73.977622, 40.789142], // Upper West Side, Manhattan
  [-73.939202, 40.752998], // Astoria, Queens
  [-73.990338, 40.735781], // Greenwich Village, Manhattan
  [-74.005941, 40.712784], // Lower Manhattan
  [-73.949997, 40.650002], // Crown Heights, Brooklyn
  [-73.870229, 40.77375], // Flushing, Queens
  [-73.963548, 40.779437], // Upper East Side, Manhattan
  // ... Add more as needed
];

export function getCoordinates() {
  return nycCoordinates;
}

export function generateTwoUniqueRandomInts(min, max) {
  const firstInt = Math.floor(Math.random() * (max - min + 1)) + min;
  let secondInt = Math.floor(Math.random() * (max - min + 1)) + min;

  // Ensure secondInt is different from firstInt
  while (secondInt === firstInt) {
    secondInt = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  return [firstInt, secondInt];
}

export function getSimplifiedStyle() {
  return new window.google.maps.StyledMapType(
    [
      {
        featureType: 'all',
        stylers: [{ saturation: -50 }, { weight: 0.1 }],
      },
      {
        elementType: 'labels',
        stylers: [{ lightness: 25 }],
      },
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit.station',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
    ],
    { name: 'Simplified' }
  );
}
