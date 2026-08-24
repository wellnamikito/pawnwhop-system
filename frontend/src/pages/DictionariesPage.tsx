import { useEffect, useMemo, useState } from "react";

import {
  districtApi,
  ownerTypeApi,
  ownershipTypeApi,
  pledgeItemTypeApi,
  socialStatusApi,
} from "@/api/dictionary";

import type {
  Dictionary,
  DictionaryRequest,
} from "@/types/dictionary";


type DictionaryApi = {
  getAll: () => Promise<Dictionary[]>;

  create: (
      data: DictionaryRequest
  ) => Promise<Dictionary>;

  update: (
      id: number,
      data: DictionaryRequest
  ) => Promise<Dictionary>;

  remove: (
      id: number
  ) => Promise<void>;
};


type DictionaryConfig = {
  key: string;
  label: string;
  api: DictionaryApi;
};


const TABS: DictionaryConfig[] = [
  {
    key: "district",
    label: "Районы",
    api: districtApi,
  },
  {
    key: "ownership_type",
    label: "Формы собственности",
    api: ownershipTypeApi,
  },
  {
    key: "owner_type",
    label: "Типы владельцев",
    api: ownerTypeApi,
  },
  {
    key: "social_status",
    label: "Социальные положения",
    api: socialStatusApi,
  },
  {
    key: "pledge_item_type",
    label: "Виды залоговых предметов",
    api: pledgeItemTypeApi,
  },
];


export default function DictionariesPage() {

  const [active, setActive] = useState(
      TABS[0].key
  );

  const tab = TABS.find(
      item => item.key === active
  )!;


  const [items, setItems] = useState<Dictionary[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  const [modalOpen, setModalOpen] = useState(false);

  const [editingItem, setEditingItem] =
      useState<Dictionary | null>(null);


  const [name, setName] = useState("");


  async function loadDictionary() {

    setLoading(true);
    setError("");

    try {

      const result =
          await tab.api.getAll();

      setItems(result);

    } catch {

      setError(
          `Не удалось загрузить справочник "${tab.label}".`
      );

      setItems([]);

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    setSearch("");

    void loadDictionary();

  }, [active]);



  async function saveDictionary() {

    if (!name.trim()) {
      return;
    }


    const data: DictionaryRequest = {
      name,
    };


    try {

      if (editingItem) {

        await tab.api.update(
            editingItem.id,
            data
        );

      } else {

        await tab.api.create(
            data
        );

      }


      setModalOpen(false);

      setEditingItem(null);

      setName("");

      await loadDictionary();


    } catch {

      setError(
          "Ошибка сохранения записи."
      );

    }

  }



  async function deleteDictionary(
      id:number
  ) {

    const confirmed =
        window.confirm(
            "Удалить запись?"
        );


    if (!confirmed) {
      return;
    }


    try {

      await tab.api.remove(id);

      await loadDictionary();


    } catch {

      setError(
          "Ошибка удаления записи."
      );

    }

  }



  function openCreate() {

    setEditingItem(null);

    setName("");

    setModalOpen(true);

  }



  function openEdit(
      item:Dictionary
  ) {

    setEditingItem(item);

    setName(item.name);

    setModalOpen(true);

  }



  const visibleItems = useMemo(() => {

    const text =
        search
            .trim()
            .toLowerCase();


    if (!text) {
      return items;
    }


    return items.filter(item =>
        item.name
            .toLowerCase()
            .includes(text)
    );


  }, [items, search]);



  return (

      <section>


        <div className="page-header">

          <div>

            <h1>
              Справочники
            </h1>


            <p className="page-description">

              Всего записей:
              {" "}
              {items.length}

            </p>

          </div>


          <button
              className="button button-primary"
              onClick={openCreate}
          >
            Добавить
          </button>


        </div>




        <div className="dictionary-tabs">

          {TABS.map(item => (

              <button

                  key={item.key}

                  type="button"

                  className={
                    item.key === active
                        ?
                        "dictionary-tab dictionary-tab-active"
                        :
                        "dictionary-tab"
                  }

                  onClick={() =>
                      setActive(item.key)
                  }

              >

                {item.label}

              </button>

          ))}


        </div>




        {error && (

            <p className="form-error">
              {error}
            </p>

        )}





        <div className="filter-bar">

          <input

              placeholder={
                `Поиск: ${tab.label}`
              }

              value={search}

              onChange={
                e =>
                    setSearch(
                        e.target.value
                    )
              }

          />

        </div>






        <div className="table-card">


          {
            loading ?

                (

                    <p className="table-message">
                      Загрузка...
                    </p>

                )

                :

                (

                    <table className="data-table">


                      <thead>

                      <tr>

                        <th>
                          Название
                        </th>

                        <th>
                          Действия
                        </th>

                      </tr>

                      </thead>



                      <tbody>


                      {
                        visibleItems.map(item => (

                            <tr key={item.id}>


                              <td>
                                {item.name}
                              </td>



                              <td>

                                <div className="table-actions">


                                  <button

                                      className="button button-secondary"

                                      onClick={() =>
                                          openEdit(item)
                                      }

                                  >
                                    Изменить
                                  </button>



                                  <button

                                      className="button button-danger"

                                      onClick={() =>
                                          deleteDictionary(
                                              item.id
                                          )
                                      }

                                  >

                                    Удалить

                                  </button>


                                </div>


                              </td>


                            </tr>


                        ))

                      }




                      {
                          !visibleItems.length && (

                              <tr>

                                <td
                                    colSpan={2}
                                    className="table-message"
                                >

                                  Нет данных

                                </td>

                              </tr>

                          )
                      }


                      </tbody>


                    </table>

                )

          }


        </div>





        {
            modalOpen && (

                <div className="modal-backdrop">


                  <div className="modal-card">


                    <div className="modal-header">


                      <h2>

                        {
                          editingItem
                              ?
                              "Редактирование"
                              :
                              "Добавление"
                        }

                      </h2>



                      <button

                          className="close-button"

                          onClick={() =>
                              setModalOpen(false)
                          }

                      >
                        ×
                      </button>


                    </div>





                    <div className="form-grid form-grid-one-column">


                      <label>

                        Название


                        <input

                            value={name}

                            onChange={
                              e =>
                                  setName(
                                      e.target.value
                                  )
                            }

                        />


                      </label>


                    </div>





                    <div className="modal-footer">


                      <button

                          className="button button-secondary"

                          onClick={() =>
                              setModalOpen(false)
                          }

                      >
                        Отмена

                      </button>



                      <button

                          className="button button-primary"

                          onClick={saveDictionary}

                      >

                        Сохранить

                      </button>


                    </div>


                  </div>


                </div>

            )
        }




      </section>

  );

}