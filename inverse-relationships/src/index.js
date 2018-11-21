import { SiteClient } from 'datocms-client';
import './style.sass';

window.DatoCmsPlugin.init((plugin) => {
  plugin.startAutoResizer();
  const dato = new SiteClient(plugin.parameters.global.datoCmsApiToken);

  const container = document.createElement('div');
  container.classList.add('container');
  document.body.appendChild(container);
  const title = document.createElement('h4');
  title.classList.add('title');
  title.textContent = plugin.parameters.instance.title;
  container.appendChild(title);

  const postItemType = Object.values(plugin.itemTypes).find(
    itemType => itemType.attributes.api_key === plugin.parameters.instance.itemTypeApiKey,
  );

  const linkField = Object.values(plugin.fields).find(field => (
    field.relationships.item_type.data.id === postItemType.id
      && field.attributes.api_key === plugin.parameters.instance.fieldApiKey
  ));

  const titleFieldId = postItemType.relationships.title_field.data.id;
  const titleField = plugin.fields[titleFieldId];
  const filter = linkField.attributes.field_type === 'link'
    ? `filter[fields][${linkField.attributes.api_key}][eq]`
    : `filter[fields][${linkField.attributes.api_key}][any_in][]`;

  const query = {
    'filter[type]': postItemType.id,
    [filter]: plugin.itemId,
    order_by: 'updated_at_DESC',
    'page[limit]': plugin.parameters.instance.limit,
    version: 'current',
  };

  dato.items.all(query)
    .then((items) => {
      items.forEach((item) => {
        const link = document.createElement('a');
        if (titleField.attributes.localized) {
          const firstLocaleWithContent = plugin.site.attributes.locales.find(locale => (
            item[titleField.attributes.api_key][locale]
          ));
          link.textContent = item[titleField.attributes.api_key][firstLocaleWithContent];
        } else {
          link.textContent = item[titleField.attributes.api_key];
        }

        const url = `/editor/item_types/${postItemType.id}/items/${item.id}/edit`;

        link.href = url;
        link.target = '_top';
        link.classList.add('link');

        container.appendChild(link);
      });
    })
    .catch((error) => {
      console.log(error);
    });
});
