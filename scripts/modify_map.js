const fs = require('fs');

// Copy from original to ensure clean state
fs.copyFileSync('components/properties/Properties2.jsx', 'components/properties/PropertiesMapCustom.jsx');

let content = fs.readFileSync('components/properties/PropertiesMapCustom.jsx', 'utf8');

// 1. Imports
content = content.replace(
    'import PropertyMap from "../common/PropertyMap";',
    `import PropertyMap from "../map/PropertyMap";\nimport { formatPrice, formatArea } from "@/lib/utils/formatters";`
);

// 2. Component name and state
content = content.replace(
    'export default function Properties2() {',
    `export default function PropertiesMapCustom() {\n  const [mapData, setMapData] = useState([]);\n  const [isMapLoading, setIsMapLoading] = useState(false);`
);

// 3. Replace sorted.slice(0, 6).map to mapData.map globally
content = content.replace(/sorted\.slice\(0, 6\)\.map/g, 'mapData.map');


// FOR listLayout AND gridLayout
// 4a. Update image sources and styles
content = content.replace(
    /src={elm\.imgSrc}\s*width={344}\s*height={315}/g,
    'src={(elm.image_url || "/images/common/property-placeholder.jpg")}\n                              style={{ objectFit: "cover", width: "100%", height: "100%" }}\n                              width={344}\n                              height={315}'
);
content = content.replace(
    /src={elm\.imgSrc}\s*width={615}\s*height={405}/g,
    'src={(elm.image_url || "/images/common/property-placeholder.jpg")}\n                              style={{ objectFit: "cover", width: "100%", height: "100%" }}\n                              width={615}\n                              height={405}'
);

// 4b. Format links
content = content.replace(/href={\`\/property-details-v1\/\${elm\.id}\`}/g, 'href={`/property-details/${elm.slug || elm.id}`}');

// 4c. Format beds, baths, sqft, prices
content = content.replace(/<span className="fw-6">{elm\.beds}<\/span>/g, '<span className="fw-6">{elm.bedrooms || 0}</span>');
content = content.replace(/<span className="fw-6">{elm\.baths}<\/span>/g, '<span className="fw-6">{elm.bathrooms || 0}</span>');
content = content.replace(/<span className="fw-6">{elm\.sqft}<\/span>/g, '<span className="fw-6">{formatArea(elm.area)}</span>');
content = content.replace(/\${elm\.price\.toLocaleString\(\)}/g, '{formatPrice(elm.price)}');

// 4d. Format Tags
content = content.replace(/<li className="flag-tag primary">Featured<\/li>\s*<li className="flag-tag style-1">For Sale<\/li>/g,
    "{elm.listing_type === 'rent' ? <li className='flag-tag success'>Cho thuê</li> : <li className='flag-tag primary'>Bán</li>}");


// FIX TEXT OVERFLOW
// Replace the h6 title structure to add 1-line truncation and min-width
content = content.replace(
    /<h6 className="text-capitalize">\s*<Link\s*href=\{\`\/property-details\/\$\{elm\.slug \|\| elm\.id\}\`\}\s*className="link text-line-clamp-1"\s*>\s*\{elm\.title\}\s*<\/Link>\s*<\/h6>/g,
    `<h6 className="text-capitalize" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                            <Link
                              href={\`/property-details/\${elm.slug || elm.id}\`}
                              className="link"
                              title={elm.title}
                            >
                              {elm.title}
                            </Link>
                          </h6>`
);

// For the grid layout title (it doesn't have text-line-clamp-1 initially)
content = content.replace(
    /<h6 className="text-capitalize">\s*<Link\s*href=\{\`\/property-details\/\$\{elm\.slug \|\| elm\.id\}\`\}\s*className="link"\s*>\s*\{elm\.title\}\s*<\/Link>\s*<\/h6>/g,
    `<h6 className="text-capitalize" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
                            <Link
                              href={\`/property-details/\${elm.slug || elm.id}\`}
                              className="link"
                              title={elm.title}
                            >
                              {elm.title}
                            </Link>
                          </h6>`
);

// Give the content container min-width: 0 so it can shrink
content = content.replace(
    /<div className="archive-bottom">/g,
    '<div className="archive-bottom" style={{ minWidth: 0 }}>'
);


// 5. Replace Map component
content = content.replace(
    '<PropertyMap />',
    `<PropertyMap onDataChange={(data, loading) => {\n            setMapData(data || []);\n            setIsMapLoading(loading);\n          }} />`
);

fs.writeFileSync('components/properties/PropertiesMapCustom.jsx', content);
console.log('Successfully rebuilt PropertiesMapCustom.jsx');
