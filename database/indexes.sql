-- внешние ключи
CREATE INDEX idx_pawnshop_owner ON pawnshop(owner_id);
CREATE INDEX idx_pawnshop_district ON pawnshop(district_id);
CREATE INDEX idx_pawnshop_ownership ON pawnshop(ownership_type_id);

CREATE INDEX idx_loan_client ON loan(client_id);
CREATE INDEX idx_loan_pawnshop ON loan(pawnshop_id);

CREATE INDEX idx_client_social_status ON client(social_status_id);
CREATE INDEX idx_owner_owner_type ON owners(owner_type_id);

CREATE INDEX idx_loan_item_type ON loan_item(item_type_id);

-- даты
CREATE INDEX idx_loan_issue_date ON loan(issue_date);
CREATE INDEX idx_loan_return_date ON loan(return_date);

-- составной
CREATE INDEX idx_loan_returned_date
    ON loan(is_returned, return_date);

-- поиск
CREATE INDEX idx_client_phone ON client(phone);
CREATE INDEX idx_loan_amount ON loan(amount);