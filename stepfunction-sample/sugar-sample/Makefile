# help で表示するためコマンドの定義は以下のように記述
# {コマンド}: ## {コマンドの説明} ## {引数使用の場合のコマンドを記述}
help: ## print this message
	@echo ""
	@echo "Command list:"
	@printf "\033[36m%-35s\033[0m %s\n" "[Sub command]" "[Description]"
	@grep -E '^[/a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | perl -pe 's%^([/a-zA-Z_-]+):.*?(##)%$$1 $$2%' | awk -F " *?## *?" '{printf "\033[36m%-35s\033[0m %s\n", $$3 ? $$3 : $$1, $$2}'
	@echo ''

bootstrap: ## bootstrap
	cdk bootstrap --profile e-playground-kohei

deploy: ## deploy
	cdk deploy --profile e-playground-kohei

destroy: ## destroy
	cdk destroy --profile e-playground-kohei

list: ## list stacks
	cdk list

synth: ## synth name={stack name}
	cdk synth $(name)

rm-sample: ## rm sample data
	aws s3 rm s3://sugar-sample-input-bucket/input.json

put-sample: ## put sample data
	aws s3 rm s3://sugar-sample-input-bucket/input.json && aws s3 cp ../input.json s3://sugar-sample-input-bucket/input.json