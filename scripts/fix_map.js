const fs = require('fs');

let content = fs.readFileSync('components/properties/Properties2.jsx', 'utf8');

// Imports
content = content.replace(
    'import PropertyMap from "../common/PropertyMap";',
    `import PropertyMap from "../map/PropertyMap";\nimport { formatPrice, formatArea } from "@/lib/utils/formatters";`
);

// Component Name
content = content.replace(
    'export default function Properties2() {',
    `export default function PropertiesMapCustom() {\n  const [mapData, setMapData] = useState([]);\n  const [isMapLoading, setIsMapLoading] = useState(false);`
);

// Map Array
content = content.replace(/sorted\.slice\(0, 6\)\.map/g, 'mapData.map');

// Layout 1 (grid) Image
content = content.replace(
    /src=\{elm\.imgSrc\}\n\s*width=\{615\}\n\s*height=\{405\}/g,
    'src={(elm.image_url || "/images/common/property-placeholder.jpg")}\n                              style={{ objectFit: "cover", width: "100%", height: "100%" }}\n                              width={615}\n                              height={405}'
);

// Layout 2 (list) Image
content = content.replace(
    /src=\{elm\.imgSrc\}\n\s*width=\{344\}\n\s*height=\{315\}/g,
    'src={(elm.image_url || "/images/common/property-placeholder.jpg")}\n                              style={{ objectFit: "cover", width: "100%", height: "100%" }}\n                              width={344}\n                              height={315}'
);

// Avatars (globally replace)
content = content.replace(
    /src=\{elm\.avatar\}/g,
    'src={elm.agent_avatar || "/images/avatar/user-image.png"}'
);
content = content.replace(
    /<span>\{elm\.agent\}<\/span>/g,
    '<span>{elm.owner_name || elm.agent || "Chưa cập nhật"}</span>'
);

// fix flex widths for list layout
content = content.replace(
    /<div className="archive-bottom">/g,
    '<div className="archive-bottom" style={{ minWidth: 0 }}>'
);
content = content.replace(
    /<div className="archive-top">/g,
    '<div className="archive-top" style={{ flexShrink: 0 }}>'
);

// fix titles
content = content.replace(
    /<h6 className="text-capitalize">\s*<Link\s*href=\{\`\/property-details-v1\/\$\{elm\.id\}\`\}\s*className="link"\s*>\s*\{elm\.title\}\s*<\/Link>\s*<\/h6>/g,
    `<h6 className="text-capitalize" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", display: "block" }}>
                            <Link href={\`/property-details/\${elm.slug || elm.id}\`} className="link" title={elm.title}>
                              {elm.title}
                            </Link>
                          </h6>`
);

content = content.replace(
    /<h6 className="text-capitalize">\s*<Link\s*href=\{\`\/property-details-v1\/\$\{elm\.id\}\`\}\s*className="link text-line-clamp-1"\s*>\s*\{elm\.title\}\s*<\/Link>\s*<\/h6>/g,
    `<h6 className="text-capitalize" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%", display: "block" }}>
                            <Link href={\`/property-details/\${elm.slug || elm.id}\`} className="link text-line-clamp-1" title={elm.title}>
                              {elm.title}
                            </Link>
                          </h6>`
);

content = content.replace(
    /href=\{\`\/property-details-v1\/\$\{elm\.id\}\`\}/g,
    'href={`/property-details/${elm.slug || elm.id}`}'
);

content = content.replace(/<span className="fw-6">\{elm\.beds\}<\/span>/g, '<span className="fw-6">{elm.bedrooms || 0}</span>');
content = content.replace(/<span className="fw-6">\{elm\.baths\}<\/span>/g, '<span className="fw-6">{elm.bathrooms || 0}</span>');
content = content.replace(/<span className="fw-6">\{elm\.sqft\}<\/span>/g, '<span className="fw-6">{formatArea(elm.area)}</span>');
content = content.replace(/\$\{elm\.price\.toLocaleString\(\)\}/g, '{formatPrice(elm.price)}');

// Fix the For Sale / Featured flags globally
content = content.replace(
    /<li className="flag-tag primary">Featured<\/li>\s*<li className="flag-tag style-1">For Sale<\/li>/g,
    "{elm.listing_type === 'rent' ? <li className='flag-tag success'>Cho thuê</li> : <li className='flag-tag primary'>Bán</li>}"
);


content = content.replace(
    '<PropertyMap />',
    '<PropertyMap onDataChange={(data, loading) => { setMapData(data || []); setIsMapLoading(loading); }} />'
);

fs.writeFileSync('components/properties/PropertiesMapCustom.jsx', content);
console.log('Fixed Custom Component cleanly');
