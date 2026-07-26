INSERT INTO loan_document (doc)
SELECT jsonb_build_object(
               'loan_id', g,
               'amount', round((random() * 49000 + 1000)::numeric, 2),
               'issue_date', (date '2023-01-01' + (random() * 900)::int)::text,
               'return_date', (date '2023-01-01' + (random() * 900)::int + (random() * 30 + 7)::int)::text,
               'penalty_percent', round((random() * 5)::numeric, 2),
               'is_returned', (random() < 0.65),
               'pawnshop', jsonb_build_object(
                       'name', 'Ломбард №' || (1 + floor(random() * 50))::int,
                       'ownership_type', (ARRAY['государственный','частный','ЗАО','ОАО'])[1 + floor(random() * 4)],
                       'address', 'ул. ' || (ARRAY['Ленина','Мира','Советская','Пушкина','Гагарина','Кирова'])[1 + floor(random() * 6)]
                    || ', д. ' || (1 + floor(random() * 100))::int,
                       'phone', '+79' || lpad(floor(random() * 999999999)::bigint::text, 9, '0'),
                       'working_hours', jsonb_build_object(
                               'opening', (8 + floor(random() * 3))::int,
                               'closing', (18 + floor(random() * 4))::int
                                        ),
                       'district', jsonb_build_object(
                               'name', (ARRAY['Центральный','Ленинский','Октябрьский','Кировский','Заводской'])[1 + floor(random() * 5)]
                                   ),
                       'owner', jsonb_build_object(
                               'full_name', jsonb_build_object(
                                'last_name', (ARRAY['Петров','Иванов','Сидоров','Кузнецов','Волков'])[1 + floor(random() * 5)],
                                'first_name', (ARRAY['Петр','Иван','Семен','Алексей','Игорь'])[1 + floor(random() * 5)],
                                'middle_name', (ARRAY['Петрович','Иванович','Семенович','Алексеевич','Игоревич'])[1 + floor(random() * 5)]
                                            ),
                               'owner_type', (ARRAY['Юридическое лицо','Индивидуальный предприниматель','Физическое лицо'])[1 + floor(random() * 3)],
                               'contacts', jsonb_build_object(
                                       'phone', '+79' || lpad(floor(random() * 999999999)::bigint::text, 9, '0')
                                           )
                                )
                           ),
               'client', jsonb_build_object(
                       'full_name', jsonb_build_object(
                        'last_name', (ARRAY['Смирнов','Кузнецов','Попов','Васильев','Соколов','Михайлов','Новиков'])[1 + floor(random() * 7)],
                        'first_name', (ARRAY['Александр','Дмитрий','Максим','Сергей','Андрей','Екатерина','Мария','Ольга'])[1 + floor(random() * 8)],
                        'middle_name', (ARRAY['Александрович','Сергеевич','Дмитриевич','Андреевна','Сергеевна','Игоревна'])[1 + floor(random() * 6)]
                                    ),
                       'birth_date', (date '1950-01-01' + (random() * 20000)::int)::text,
                       'social_status', (ARRAY['Домохозяйка','Предприниматель','Рабочий','Служащий','Пенсионер','Студент'])[1 + floor(random() * 6)],
                       'address', 'ул. ' || (ARRAY['Садовая','Лесная','Полевая','Заречная','Школьная'])[1 + floor(random() * 5)]
                    || ', д. ' || (1 + floor(random() * 100))::int,
                       'contacts', jsonb_build_object(
                               'phone', '+79' || lpad(floor(random() * 999999999)::bigint::text, 9, '0')
                                   )
                         ),
               'items', (
                   SELECT jsonb_agg(jsonb_build_object(
                           'type', (ARRAY['часы','ювелирное изделие','картина','электроника','антиквариат'])[1 + floor(random() * 5)],
                           'description', 'Предмет №' || i,
                           'value', round((random() * 45000 + 500)::numeric, 2)
                                    ))
                   FROM generate_series(1, (1 + floor(random() * 3))::int) AS i
               )
       )
FROM generate_series(1, 150000) AS g;